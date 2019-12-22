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

interface ICatalogLeafDeprecationItemAlternatePackage {
    "@id": string;
    id: string;
    range: string;
}

interface ICatalogLeafDeprecationItem {
    "@id": string;
    alternatePackage: ICatalogLeafDeprecationItemAlternatePackage;
    reasons: string[];
}

export interface ICatalogLeaf {
    "@id": string;
    authors: string;
    "catalog:commitId": string;
    "catalog:commitTimeStamp": string;
    created: string;
    dependencyGroups: any[];
    deprecation: ICatalogLeafDeprecationItem;
    description: string;
    iconUrl: string;
    id: string;
    isPrerelease: boolean;
    language: string;
    lastEdited: string;
    licenseUrl: string;
    licenseFile: string;
    licenseExpression: string;
    listed: boolean;
    minClientVersion: string;
    packageHash: string;
    packageHashAlgorithm: string;
    packageSize: number;
    projectUrl: string;
    published: string;
    releaseNotes: string;
    requireLicenseAcceptance: string;
    summary: string;
    title: string;
    verbatimVersion: string;
    version: string;
    tags: string[];
}

interface IRegistrationCatalogEntry {
    "@id": string;
    authors: string;
    "catalog:commitId": string;
    "catalog:commitTimeStamp": string;
    created: string;
    dependencyGroups: any[];
    deprecation: ICatalogLeafDeprecationItem;
    description: string;
    iconUrl: string;
    id: string;
    isPrerelease: boolean;
    licenseUrl: string;
    licenseExpression: string;
    listed: boolean;
    minClientVersion: string;
    packageSize: number;
    projectUrl: string;
    published: string;
    releaseNotes: string;
    requireLicenseAcceptance: string;
    summary: string;
    title: string;
    version: string;
    tags: string[];
}

interface IRegistrationLeaf {
    "@id": string;
    catalogEntry: IRegistrationCatalogEntry;
    packageContent: string;
}

export interface IRegistrationPage {
    "@id": string;
    commitId: string;
    commitTimeStamp: string;
    count: number;
    items: IRegistrationLeaf[]; // can be absent, need to request "@id" for the full page
    parent: string;
    lower: string;
    upper: string;
}

export interface IRegistrationIndex {
    "@id": string;
    commitId: string;
    commitTimeStamp: string;
    count: number;
    items: IRegistrationPage[];
}