/// <reference path="../node_modules/@types/jquery/JQuery.d.ts" />

import { ICatalogPage, ICatalogIndex } from './nugetV3Objects'

interface ICatalogPageReceived {
    (page: ICatalogPage): void;
}

export class CatalogPoller {
    private feedUrl: string;
    private pollDelay: number;
    private pageCallback: ICatalogPageReceived;
    private lastPageUrl: string;
    private intervalId: number;

    constructor(feedUrl: string, pollDelay: number, pageCallback: ICatalogPageReceived) {
        this.feedUrl = feedUrl;
        this.pollDelay = pollDelay;
        this.pageCallback = pageCallback;
        this.poll();
        this.intervalId = window.setInterval(() => this.onTimer(), this.pollDelay);
    }

    disable(): void {
        window.clearInterval(this.intervalId);
    }

    private poll(): void {
        $.ajax({
            url: this.feedUrl,
            success: data => this.onCatalogIndexReceived(data),
            error: (_, textStatus, errorThrown) => console.log(`Failed to get catalog index ${this.feedUrl}: ${textStatus}`)
        });
    }

    private onTimer(): void {
        if (!this.lastPageUrl)
        {
            return;
        }
        $.ajax({
            url: this.lastPageUrl,
            success: data => this.onLatestPageReceived(data),
            error: (_, textStatus, errorThrown) => console.log(`Failed to get the latest catalog page ${this.lastPageUrl}: ${textStatus}`)
        });
    }

    private onCatalogIndexReceived(catalogIndex: ICatalogIndex): void {
        catalogIndex.items.sort((a, b) => -a.commitTimeStamp.localeCompare(b.commitTimeStamp));

        let latestPage = catalogIndex.items[0];
        $.ajax({
            url: latestPage["@id"],
            success: data => this.onLatestPageReceived(data),
            error: (_, textStatus, errorThrown) => console.log(`Failed to get catalog page ${latestPage["@id"]}: ${textStatus}`)
        });
    }

    private onLatestPageReceived(page: ICatalogPage): void {
        this.pageCallback(page);
        this.lastPageUrl = page["@id"];
        this.tryNextPage(page);
    }

    private tryNextPage(page: ICatalogPage): void {
        if (page.count < 540) {
            return;
        }
        let pageUrl = page["@id"];
        let match = /^(.*?)page(\d+)\.json$/.exec(pageUrl);
        if (!match) {
            return;
        }

        let pageIndex = parseInt(match[2], 10);
        let nextPage = pageIndex + 1;
        let url = match[1] + `page${nextPage}.json`;
        $.ajax({
            url: url,
            success: data => this.onLatestPageReceived(data)
        });
    }
}