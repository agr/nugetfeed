export function removeVersionMetadata(version: string) {
    version = version.toLowerCase();
    let plusPos = version.indexOf('+');
    if (plusPos >= 0) {
        return version.substring(0, plusPos);
    }
    return version;
}