import { ICatalogPage, ICatalogLeaf } from './nugetV3Objects'
import { viewState, PackageState, Package } from './viewState'

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
                pkg.originalVersion(packageVersion);
                pkg.catalogLeafUrl(leafUrl);
                pkg.catalogItemTimestamp(itemTs);

                if (element["@type"] === CatalogItemType.PackageDetails) {
                    $.ajax({
                        url: element["@id"],
                        success: data => this.processPackageDetails(pkg, data),
                        error: (_, textStatus, errorThrown) => console.log(`Failed to get the package details ${element["@id"]}: ${textStatus}`)
                    });

                    // queue status updates
                }
            }
        });
    }

    private processPackageDetails(pkg: Package, data: ICatalogLeaf): void {
        pkg.normalizedVersion(CatalogPageProcessor.removeVersionMetadata(data.version));
    }

    private static removeVersionMetadata(version: string) {
        version = version.toLowerCase();
        let plusPos = version.indexOf('+');
        if (plusPos >= 0) {
            return version.substring(0, plusPos);
        }
        return version;
    }
}