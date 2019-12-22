export class SemVer {
    major: number = 0;
    minor: number = 0;
    patch: number = 0;
    preRelease: (string | number)[] = [];
    metadata: string = null;

    compare(other: SemVer): number {
        if (this.major < other.major) {
            return -1;
        }
        if (this.major > other.major) {
            return 1;
        }
        if (this.minor < other.minor) {
            return -1;
        }
        if (this.minor > other.minor) {
            return 1;
        }
        if (this.patch < other.patch) {
            return -1;
        }
        if (this.patch > other.patch) {
            return 1;
        }

        let numIdentifiers = Math.min(this.preRelease.length, other.preRelease.length);
        for (let i = 0; i < numIdentifiers; ++i) {
            let our = this.preRelease[i];
            let their = other.preRelease[i];
            if (typeof(our) === "number" && typeof(their) === "string") {
                return -1;
            }
            if (typeof(our) === "string" && typeof(their) === "number") {
                return 1;
            }
            if (typeof(our) === "string" && typeof(their) === "string") {
                let cmp = our.localeCompare(their);
                if (cmp !== 0) {
                    return cmp;
                }
            }
            if (typeof(our) === "number" && typeof(their) === "number") {
                let cmp = our - their;
                if (cmp !== 0) {
                    return cmp;
                }
            }
        }

        return this.preRelease.length - other.preRelease.length;
    }

    static tryParse(version: string): SemVer {
        let result = new SemVer();

        let re = /^(\d+)\.(\d+)\.(\d+)(-[^+]+)?(\+.*)?$/;
        let match = re.exec(version);
        if (!match) {
            return null;
        }

        result.major = parseInt(match[1]);
        if (isNaN(result.major)) {
            return null;
        }

        result.minor = parseInt(match[2]);
        if (isNaN(result.minor)) {
            return null;
        }

        result.patch = parseInt(match[3]);
        if (isNaN(result.patch)) {
            return null;
        }

        let idx = 4;
        if (match[idx] && match[idx].startsWith("-")) {
            // have pre-release identifier(s)
            // TODO: process;

            let preReleaseData = match[idx].substring(1);
            let split = preReleaseData.split(/\.+/);

            for (let element of split) {
                let numeric = parseInt(element);
                if (isNaN(numeric)) {
                    result.preRelease.push(element);
                }
                else {
                    result.preRelease.push(numeric);
                }
            }

            ++idx;
        }

        if (match[idx] && match[idx].startsWith("+")) {
            // have build metadata
            result.metadata = match[idx].substring(1);
        }

        return result;
    }
}
