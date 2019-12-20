import { load, IServiceIndex, IServiceIndexItem } from './serviceIndex'
import { CatalogPoller, ICatalogPage } from './catalogPoller'

window.addEventListener("DOMContentLoaded", event => {
    load("https://api.nuget.org/v3/index.json", onServiceIndexLoad, (status, error) => console.log(status));

    function onServiceIndexLoad(serviceIndex: IServiceIndex): void {
        let catalogResource = serviceIndex.resources.filter(e => e["@type"] === "Catalog/3.0.0")[0];

        let poller = new CatalogPoller(catalogResource["@id"], 30000, page => onLatestPageLoaded(page));
    }

    function onLatestPageLoaded(page: ICatalogPage): void {
        console.log("Number of items: " + page.count);
    }

});

