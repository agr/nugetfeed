import { removeVersionMetadata } from "./util";
import { Package, PackageState } from "./viewState";

interface IFlatContainerInfo {
    id: string;
    normalizedVersion: string;
    package: Package;
    url: string;
}

export class FlatContainerPoller {
    private baseUrl: string;
    private packages: IFlatContainerInfo[];

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.packages = [];
    }

    add(packageId: string, normalizedVersion: string, pkg: Package): void {
        let id = packageId.toLowerCase();
        let ver = removeVersionMetadata(normalizedVersion.toLowerCase());
        let own: IFlatContainerInfo = {
            id: id,
            normalizedVersion: ver,
            package: pkg,
            url: "",
        };
        this.packages.push(own);

        this.doRequest(own);
    }

    private doRequest(fci: IFlatContainerInfo): void {
        fci.url = `${this.baseUrl}${fci.id}/${fci.normalizedVersion}/${fci.id}.${fci.normalizedVersion}.nupkg`;
        $.ajax({
            url: fci.url,
            method: "HEAD",
            success: _ => this.onNupkgExists(fci)
        })
    }

    private onNupkgExists(fci: IFlatContainerInfo) {
        let index = this.packages.indexOf(fci);
        if (index >= 0) {
            this.packages.splice(index, 1);
        }
        let state = fci.package.state();
        state |= PackageState.PresentInFlatContainer;
        fci.package.state(state);
        fci.package.flatContainerUrl(fci.url);
    }
}