import { IRegistrationIndex, IRegistrationPage, ICatalogPageItem } from "./nugetV3Objects";
import { SemVer } from "./semver";
import { Package, PackageState } from "./viewState";
import { IntervalPoller } from "./intervalPoller";

class PackageInfo {
    id: string;
    normalizedVersion: string;
    expectedLeafUrl: string;
    package: Package;
}

export class RegistrationPoller {
    private baseUrl: string;
    private poller: IntervalPoller<PackageInfo>;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.poller = new IntervalPoller(30000, pi => this.doRequest(pi), 30 * 60 * 1000); // 30 minutes in milliseconds
    }

    add(leaf: ICatalogPageItem, pkg: Package): void {
        let pi = new PackageInfo();
        pi.id = leaf["nuget:id"].toLowerCase();
        pi.normalizedVersion = leaf["nuget:version"].toLowerCase();
        pi.expectedLeafUrl = leaf["@id"];
        pi.package = pkg;
        this.poller.add(pi);
        this.doRequest(pi);
    }

    private doRequest(pi: PackageInfo): void {
        let url = `${this.baseUrl}${pi.id}/index.json`;
        $.ajax({
            url: url,
            success: data => this.onReceivedRegistrationIndex(pi, data),
            error: (_, textStatus, errorThrown) => console.log(`Failed to get the registration blob ${url}: ${textStatus}`)
        });
    }

    private onReceivedRegistrationIndex(pi: PackageInfo, data: IRegistrationIndex): void {
        let version = SemVer.tryParse(pi.normalizedVersion);
        if (!version) {
            return;
        }

        let page = RegistrationPoller.findPage(version, data.items);
        if (!page){
            return;
        }

        if (page.items) {
            this.processRegistrationPage(pi, page);
        }
        else {
            $.ajax({
                url: page["@id"],
                success: data => this.processRegistrationPage(pi, data),
                error: (_, textStatus, errorThrown) => console.log(`Failed to get the registration page ${page["@id"]}: ${textStatus}`)
            });
        }
    }

    private static findPage(version: SemVer, pages: IRegistrationPage[]): IRegistrationPage {
        for (let page of pages) {
            let lower = SemVer.tryParse(page.lower);
            if (!lower) {
                console.warn(`Failed to parse registaration page's lower version: ${page.lower} (${page["@id"]})`);
                continue;
            }
            let upper = SemVer.tryParse(page.upper);
            if (!upper) {
                console.warn(`Failed to parse registration page's upper version: ${page.upper} (${page["@id"]})`);
            }
            if (lower.compare(version) <= 0 && version.compare(upper) <= 0) {
                return page;
            }
        }

        return null;
    }

    private processRegistrationPage(pi: PackageInfo, page: IRegistrationPage): void {
        for (let leaf of page.items) {
            if (leaf.catalogEntry["@id"] === pi.expectedLeafUrl) {
                let state = pi.package.state();
                state |= PackageState.PresentInRegistration;
                pi.package.state(state);
                pi.package.registrationUrl(page["@id"]);
                this.poller.remove(pi);
            }
        }
    }
}