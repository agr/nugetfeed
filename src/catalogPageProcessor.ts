import { ICatalogPage, ICatalogLeaf, ICatalogPageItem } from './nugetV3Objects'
import { viewState, PackageState, Package } from './viewState'
import { removeVersionMetadata } from './util';

enum CatalogItemType {
    PackageDetails = "nuget:PackageDetails",
    PackageDelete = "nuget:PackageDelete",
}

interface CatalogPageItemProcessor {
    (pageItem: ICatalogPageItem, pkg: Package): void;
}

interface CatalogLeafProcessor {
    (leaf: ICatalogLeaf, pkg: Package): void;
}

export class CatalogPageProcessor {
    private seenIds: Record<string, boolean>;
    private cutoffTime: Date;
    private pageItemProcessor: CatalogPageItemProcessor;
    private leafProcessor: CatalogLeafProcessor;

    constructor(pageItemProcessor: CatalogPageItemProcessor, leafProcessor: CatalogLeafProcessor) {
        this.seenIds = {};
        this.pageItemProcessor = pageItemProcessor;
        this.leafProcessor = leafProcessor;
    }

    processCatalogPage(page: ICatalogPage): void {
        page.items.sort((a, b) => -a.commitTimeStamp.localeCompare(b.commitTimeStamp));
        let firstTime = false;
        if (Object.keys(this.seenIds).length === 0)
        {
            // got the data for the first time
            if (page.items.length > 50){
                page.items = page.items.slice(0, 50);
            }
            this.cutoffTime = new Date(page.items[page.items.length - 1].commitTimeStamp);
            firstTime = true;
        }
        page.items.reverse();
        page.items.forEach(pageItem => {
            let id = pageItem["@type"] + pageItem["@id"];
            if (!this.seenIds[id]){
                this.seenIds[id] = true;
                let itemTs = new Date(pageItem.commitTimeStamp);
                if (!firstTime && itemTs <= this.cutoffTime)
                {
                    return;
                }
                let pkg = viewState.getOrAddPackage(id);
                let state = pageItem["@type"] === CatalogItemType.PackageDelete ? PackageState.Deleted : PackageState.CatalogOnly;
                let packageId = pageItem["nuget:id"];
                let packageVersion = pageItem["nuget:version"];
                let leafUrl = pageItem["@id"];
                pkg.state(state);
                pkg.id(packageId);
                pkg.originalVersion(packageVersion);
                pkg.catalogLeafUrl(leafUrl);
                pkg.catalogItemTimestamp(itemTs);

                if (pageItem["@type"] === CatalogItemType.PackageDetails) {
                    $.ajax({
                        url: pageItem["@id"],
                        success: data => this.processPackageDetails(pkg, data),
                        error: (_, textStatus, errorThrown) => console.log(`Failed to get the package details ${pageItem["@id"]}: ${textStatus}`)
                    });

                    // queue status updates
                    if (this.pageItemProcessor) {
                        this.pageItemProcessor(pageItem, pkg);
                    }
                }
            }
        });
    }

    private processPackageDetails(pkg: Package, data: ICatalogLeaf): void {
        pkg.normalizedVersion(removeVersionMetadata(data.version));
        if (this.leafProcessor)
        {
            this.leafProcessor(data, pkg);
        }
    }
}