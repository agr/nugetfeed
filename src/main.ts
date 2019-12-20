import { load, IServiceIndex } from './serviceIndex'

window.addEventListener("DOMContentLoaded", event => {
    load("https://api.nuget.org/v3/index.json", onServiceIndexLoad, (status, error) => console.log(status));

    function onServiceIndexLoad(serviceIndex: IServiceIndex): void {
        console.log(serviceIndex.version);
    }

});

