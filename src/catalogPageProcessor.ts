import { ICatalogPage } from './catalogPoller'
import { viewState, PackageState } from './viewState'

enum CatalogItemType {
    PackageDetails = "nuget:PackageDetails",
    PackageDelete = "nuget:PackageDelete",
}

export class CatalogPageProcessor {
    private seenIds: Record<string, boolean>;
    private cutoffTime: Date;

    constructor() {
        this.seenIds = {};
    }

    processCatalogPage(page: ICatalogPage): void {
        page.items.sort((a, b) => -a.commitTimeStamp.localeCompare(b.commitTimeStamp));
        if (Object.keys(this.seenIds).length === 0)
        {
            // got the data for the first time
            if (page.items.length > 50){
                page.items = page.items.slice(0, 50);
            }
            this.cutoffTime = new Date(page.items[page.items.length - 1].commitTimeStamp);
        }
        page.items.reverse();
        page.items.forEach(element => {
            let id = element["@type"] + element["@id"];
            if (!this.seenIds[id]){
                this.seenIds[id] = true;
                let itemTs = new Date(element.commitTimeStamp);
                if (itemTs < this.cutoffTime)
                {
                    return;
                }
                let pkg = viewState.getOrAddPackage(id);
                let state = element["@type"] === CatalogItemType.PackageDelete ? PackageState.Deleted : PackageState.CatalogOnly;
                let packageId = element["nuget:id"];
                let packageVersion = element["nuget:version"];
                let leafUrl = element["@id"];
                pkg.state(state);
                pkg.id(packageId);
                pkg.normalizedVersion(packageVersion);
                pkg.catalogLeafUrl(leafUrl);
                pkg.catalogItemTimestamp(itemTs);

                if (element["@type"] === CatalogItemType.PackageDetails) {
                    // queue status updates
                }
            }
        });
    }
}