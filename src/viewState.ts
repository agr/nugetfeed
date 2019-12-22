/// <reference path="../node_modules/@types/knockout/index.d.ts" />

export enum PackageState {
    Unknown = 0,

    PresentInCatalog = 1 << 0,
    PresentInRegistration = 1 << 1,
    PresentInSearch = 1 << 2,
    PresentInFlatContainer = 1 << 3,
    Deleted = 1 << 16,

    CatalogOnly = PresentInCatalog,
    Available = PresentInCatalog | PresentInRegistration | PresentInSearch | PresentInFlatContainer,
}

export class Package {
    state: KnockoutObservable<PackageState>;
    id: KnockoutObservable<string>;
    normalizedVersion: KnockoutObservable<string>;
    originalVersion: KnockoutObservable<string>;
    galleryUrl: KnockoutComputed<string>;
    catalogLeafUrl: KnockoutObservable<string>;
    registrationUrl: KnockoutObservable<string>;
    flatContainerUrl: KnockoutObservable<string>;
    catalogItemTimestamp: KnockoutObservable<Date>;
    catalogItemAgeMinutes: KnockoutComputed<number>;
    listed: KnockoutObservable<boolean>;

    constructor(viewState: ViewState) {
        this.state = ko.observable(PackageState.Unknown);
        this.id = ko.observable("");
        this.normalizedVersion = ko.observable("");
        this.originalVersion = ko.observable("");
        this.galleryUrl = ko.pureComputed(() => 
            this.id()
                ? (this.normalizedVersion() 
                    ? `https://www.nuget.org/packages/${this.id()}/${this.normalizedVersion()}`
                    : `https://www.nuget.org/packages/${this.id()}`)
                : null);
        this.catalogLeafUrl = ko.observable("");
        this.registrationUrl = ko.observable("");
        this.flatContainerUrl = ko.observable("");
        this.catalogItemTimestamp = ko.observable(new Date());
        this.catalogItemAgeMinutes = ko.pureComputed(() => (viewState.now().valueOf() - this.catalogItemTimestamp().valueOf()) / 60000);
        this.listed = ko.observable(true);
    }
}

class ViewState {
    packages: KnockoutObservableArray<Package>;
    now: KnockoutObservable<Date>;
    private packageLookup: Record<string, Package>;

    constructor() {
        this.packages = ko.observableArray();
        this.now = ko.observable(new Date());
        this.packageLookup = {};
    }

    getOrAddPackage(id: string): Package {
        let pkg = this.packageLookup[id];
        if (!pkg)
        {
            pkg = new Package(this);
            this.packages.unshift(pkg);
            this.packageLookup[id] = pkg;
        }

        return pkg;
    }
}

export let viewState = new ViewState();