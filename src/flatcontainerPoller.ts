import { removeVersionMetadata } from "./util";
import { Package, PackageState } from "./viewState";
import { IntervalPoller } from "./intervalPoller";

interface IFlatContainerInfo {
    id: string;
    normalizedVersion: string;
    package: Package;
    url: string;
}

export class FlatContainerPoller {
    private baseUrl: string;
    private poller: IntervalPoller<IFlatContainerInfo>;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.poller = new IntervalPoller<IFlatContainerInfo>(30000, fci => this.doRequest(fci), 30 * 60 * 1000);
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
        this.poller.add(own);

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
        this.poller.remove(fci);
        let state = fci.package.state();
        state |= PackageState.PresentInFlatContainer;
        fci.package.state(state);
        fci.package.flatContainerUrl(fci.url);
    }
}