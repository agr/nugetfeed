
export interface ICatalogPageReceived {
    (): void;
}

interface ICatalogIndexItem {
    "@id": string;
    "@type": string;
    commitId: string;
    commitTimeStamp: Date;
    count: number;
}

interface ICatalogIndex {
    "@id": string;
    commitId: string;
    commitTimeStamp: Date;
    count: number;
    "nuget:lastCreated": Date;
    "nuget:lastDeleted": Date;
    "nuget:lastEdited": Date;
    items: ICatalogIndexItem[];
}

export class FeedPoller {
    private feedUrl: string;
    private pollDelay: number;

    constructor(feedUrl: string, pollDelay: number) {
        this.feedUrl = feedUrl;
        this.pollDelay = pollDelay;
    }
}