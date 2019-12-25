import { load, IServiceIndex } from './serviceIndex'
import { CatalogPoller } from './catalogPoller'
import { CatalogPageProcessor } from './catalogPageProcessor';
import { viewState, Package } from './viewState';
import { RegistrationPoller } from './registrationPoller';
import { FlatContainerPoller } from './flatcontainerPoller';
import { ICatalogPageItem, ICatalogLeaf } from './nugetV3Objects';
import { SearchPoller } from './searchPoller';

window.addEventListener("DOMContentLoaded", event => {
    let catalogPoller: CatalogPoller;
    let registrationPoller: RegistrationPoller;
    let pageProcessor: CatalogPageProcessor;
    let flatContainerPoller: FlatContainerPoller;
    let searchPoller: SearchPoller;
    load("https://api.nuget.org/v3/index.json", onServiceIndexLoad, (status, error) => console.log(status));

    function onServiceIndexLoad(serviceIndex: IServiceIndex): void {
        let catalogResource = serviceIndex.resources.filter(e => e["@type"] === "Catalog/3.0.0")[0];
        let registrationBase = serviceIndex.resources.filter(e => e["@type"] === "RegistrationsBaseUrl/3.6.0")[0];
        let flatContainerBase = serviceIndex.resources.filter(e => e["@type"] === "PackageBaseAddress/3.0.0")[0];
        let searchService = serviceIndex.resources.filter(e => e["@type"] === "SearchQueryService")[0];

        registrationPoller = new RegistrationPoller(registrationBase["@id"]);
        flatContainerPoller = new FlatContainerPoller(flatContainerBase["@id"]);
        searchPoller = new SearchPoller(searchService["@id"]);
        pageProcessor = new CatalogPageProcessor((pageItem, pkg) => pageItemProcessor(pageItem, pkg), (leaf, pkg) => catalogLeafProcessor(leaf, pkg));
        catalogPoller = new CatalogPoller(catalogResource["@id"], 30000, page => pageProcessor.processCatalogPage(page));
    }

    function pageItemProcessor(pageItem: ICatalogPageItem, pkg: Package) {
        registrationPoller.add(pageItem, pkg);
        flatContainerPoller.add(pageItem["nuget:id"], pageItem["nuget:version"], pkg);
    }

    function catalogLeafProcessor(leaf: ICatalogLeaf, pkg: Package) {
        searchPoller.add(leaf.id, leaf.version, leaf.listed, pkg);
    }

    function refreshTimeAgo(): void {
        viewState.now(new Date());
    }

    ko.applyBindings(viewState, document.getElementById("nuget-container"));
    let koTimeAgoIntervalId = window.setInterval(refreshTimeAgo, 10000);
});

