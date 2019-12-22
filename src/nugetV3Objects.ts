interface ICatalogIndexItem {
    "@id": string;
    "@type": string;
    commitId: string;
    commitTimeStamp: string;
    count: number;
}

export interface ICatalogIndex {
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

export interface ICatalogLeaf {
    "@id": string;
    authors: string;
    "catalog:commitId": string;
    "catalog:commitTimeStamp": string;
    created: string;
    description: string;
    id: string;
    isPrerelease: boolean;
    lastEdited: string;
    licenseUrl: string;
    listed: boolean;
    packageHash: string;
    packageHashAlgorithm: string;
    packageSize: number;
    projectUrl: string;
    published: string;
    releaseNotes: string;
    requireLicenseAcceptance: string;
    verbatimVersion: string;
    version: string;
    tags: string[];
}