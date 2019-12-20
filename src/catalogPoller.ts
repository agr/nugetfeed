/// <reference path="../node_modules/@types/jquery/JQuery.d.ts" />

interface ICatalogIndexItem {
    "@id": string;
    "@type": string;
    commitId: string;
    commitTimeStamp: string;
    count: number;
}

interface ICatalogIndex {
    "@id": string;
    commitId: string;
    commitTimeStamp: string;
    count: number;
    "nuget:lastCreated": string;
    "nuget:lastDeleted": string;
    "nuget:lastEdited": string;
    items: ICatalogIndexItem[];
}

interface ICatalogPageItem {
    "@id": string;
    "@type": string;
    commitId: string;
    commitTimeStamp: string;
    "nuget:id": string;
    "nuget:version": string;
}

export interface ICatalogPage {
    "@id": string;
    "@type": string;
    commitId: string;
    commitTimeStamp: string;
    count: number;
    parent: string;
    items: ICatalogPageItem[];
}

interface ICatalogPageReceived {
    (page: ICatalogPage): void;
}

export class CatalogPoller {
    private feedUrl: string;
    private pollDelay: number;
    private pageCallback: ICatalogPageReceived;

    constructor(feedUrl: string, pollDelay: number, pageCallback: ICatalogPageReceived) {
        this.feedUrl = feedUrl;
        this.pollDelay = pollDelay;
        this.pageCallback = pageCallback;
        this.poll();
    }

    private poll(): void {
        $.ajax({
            url: this.feedUrl,
            success: data => this.onCatalogIndexReceived(data),
            error: (_, textStatus, errorThrown) => console.log("Failed to get catalog index " + this.feedUrl + ": " + textStatus)
        });
    }

    private onCatalogIndexReceived(catalogIndex: ICatalogIndex): void {
        catalogIndex.items.sort((a, b) => -a.commitTimeStamp.localeCompare(b.commitTimeStamp));

        let latestPage = catalogIndex.items[0];
        $.ajax({
            url: latestPage["@id"],
            success: data => this.onLatestPageReceived(data),
            error: (_, textStatus, errorThrown) => console.log("Failed to get catalog page " + latestPage["@id"] + ": " + textStatus)
        });
    }

    private onLatestPageReceived(page: ICatalogPage): void {
        this.pageCallback(page);
    }
}