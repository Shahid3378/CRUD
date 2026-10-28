module.exports.search = async ({ model, searchValue, caseSensitive = false }) => {
    // , encryptedFields = [], searchableFields = [], page = 1, limit = 10, sorting = {},
    try {
        const documents = await model.find({}).lean();

        const search = String(searchValue || "").trim();

        let results = documents;

        if (search) {

            const searchText = caseSensitive ? search : search.toLowerCase();

            results = documents.filter((document) => {

                const fields = searchableFields.length ? searchableFields : Object.keys(document);

                return fields.some((field) => {

                    let value = document[field];

                    if ( value === null || value === undefined)  return false; 

                    // if (encryptedFields.includes(field)) {
                    //     try {
                    //         // console.log(value, "Before decryptedData call")
                    //         value = module.exports.decryptedData(value);
                    //     } catch (error) {
                    //         console.log( `Unable to decrypt ${field}:`, error.message );
                    //         return false;
                    //     }
                    // }

                    // if ( typeof value === "object" && value !== null && typeof value.toString === "function" ) {
                    //     value = value.toString();
                    // }

                    // if ( typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
                    //     return false;
                    // }

                    value = String(value);

                    if (!caseSensitive) {
                        value = value.toLowerCase();
                    }

                    // Contains search
                    return value.includes(searchText);

                });

            });

        }

        const total = results.length;

        if (sorting && Object.keys(sorting).length > 0) {

            const sortField = Object.keys(sorting)[0];
            const sortOrder = Number(sorting[sortField]);

            results.sort((a, b) => {

                let valueA = a[sortField];
                let valueB = b[sortField];

                if (valueA === undefined) return 1;
                if (valueB === undefined) return -1;

                // Convert BSON values if required
                if (
                    typeof valueA === "object" &&
                    valueA !== null &&
                    typeof valueA.toString === "function"
                ) {
                    valueA = valueA.toString();
                }

                if (
                    typeof valueB === "object" &&
                    valueB !== null &&
                    typeof valueB.toString === "function"
                ) {
                    valueB = valueB.toString();
                }

                if (valueA < valueB) {
                    return -1 * sortOrder;
                }

                if (valueA > valueB) {
                    return 1 * sortOrder;
                }

                return 0;

            });

        }

        const pageNumber = Number(page) || 1;
        const pageLimit = Number(limit) || 10;

        const skip = (pageNumber - 1) * pageLimit;

        const paginatedResults = results.slice(
            skip,
            skip + pageLimit
        );

        return {
            data: paginatedResults,
            total
        };

    } catch (error) {

        console.error("searchAlgorithm error:", error);

        throw error;

    }
};