import { IntervalPoller } from "./intervalPoller";
import { SemVer } from "./semver";
import { ISearchResponse } from "./nugetV3Objects";
import { Package, PackageState } from "./viewState";

interface ISearchInfo {
    id: string;
    version: string;
    isListed: boolean;
    isPrerelease: boolean;
    package: Package;
}

export class SearchPoller {
    private baseUrl: string;
    private poller: IntervalPoller<ISearchInfo>;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.poller = new IntervalPoller<ISearchInfo>(30000, i => this.doRequest(i), 30 * 60 * 1000);
    }

    add(id: string, normalizedVersion: string, isListed: boolean, pkg: Package): void {
        let info: ISearchInfo = {
            id: id.toLowerCase(),
            version: normalizedVersion.toLowerCase(),
            isListed: isListed,
            isPrerelease: false,
            package: pkg,
        };
        let semver = SemVer.tryParse(info.version);
        if (!semver) {
            console.warn(`Failed to parse the version for ${id} ${normalizedVersion}`);
            return;
        } else {
            if (semver.preRelease) {
                info.isPrerelease = true;
            }
        }
        this.poller.add(info);
        this.doRequest(info);
    }

    private doRequest(info: ISearchInfo): void {
        let url = `${this.baseUrl}?q=PackageId:${info.id}&semVerLevel=2.0.0&prerelease=${info.isPrerelease}`;
        info.package.searchUrl(url);
        $.ajax({
            url: url,
            success: data => this.processSearchResult(info, data, url),
            error: (_, textStatus, errorThrown) => console.log(`Failed to get the search response ${url}: ${textStatus} ${errorThrown}`)
        });
    }

    private processSearchResult(info: ISearchInfo, data: ISearchResponse, url: string): void {
        if (data.totalHits === 0) {
            if (!info.isListed) {
                this.markFound(info);
            }
            return;
        }
        if (data.totalHits !== 1) {
            console.warn(`Unexpected number of responses to ${url}: ${data.totalHits}`);
            this.poller.remove(info);
        }

        let result = data.data[0];
        let idx = result.versions.findIndex(e => e.version === info.version);
        if ((info.isListed && idx >= 0) || (!info.isListed && idx < 0)) {
            this.markFound(info);
        }
    }

    private markFound(info: ISearchInfo) {
        this.poller.remove(info);
        let state = info.package.state();
        state |= PackageState.PresentInSearch;
        info.package.state(state);
    }
}