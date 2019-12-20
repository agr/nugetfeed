/// <reference path="../node_modules/@types/jquery/JQuery.d.ts" />

export interface IServiceIndexItem {
    "@id": string;
    "@type": string;
    comment: string;
}

export interface IServiceIndex {
    version: string;
    resources: IServiceIndexItem[];
}

export function load(url: string, success:(serviceIndex:IServiceIndex) => void, error:(status: string, errorThrown: string) => void): void {
    $.ajax({
        url: url,
        success: data => success(data),
        error: (_, textStatus, errorThrown) => error(textStatus, errorThrown)
    });
}