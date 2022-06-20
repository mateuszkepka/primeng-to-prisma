import { FilterMetadata, LazyLoadEvent, SortEvent, SortMeta } from "primeng/api";

export const mapSortChangeToPrisma = (event: SortEvent) => {
    if (!event) {
        return;
    }

    const result: any = {};
    if (event.mode === `single`) {
        result.orderBy = {};
        result.orderBy[event.field] = event.order === 1 ? `asc` : `desc`;
    }

    if (event.mode === `multiple`) {
        result.orderBy = [];
        event.multiSortMeta.forEach((sortMetadata: SortMeta) => {
            result.orderBy.push({ [sortMetadata.field]: sortMetadata.order === 1 ? `asc` : `desc` });
        });
    }

    return result;
};

export const mapPrimengFilterParamsToPrisma = (filters: Record<string, FilterMetadata>) => {
    const result: any = {
        where: {},
    };
    Object.entries(filters).forEach(([key, value]) => {
        if (value.value) {
            if (value.matchMode === `notEquals` || value.matchMode === `dateIsNot` || value.matchMode === `isNot`) {
                result.where[key] = { not: { equals: value.value } };
            }

            if (value.matchMode === `notContains`) {
                result.where[key] = { not: { contains: value.value } };
            }

            if (value.matchMode === `dateIs` || value.matchMode === `is`) {
                result.where[key] = { equals: value.value };
            }

            if (value.matchMode === `dateBefore` || value.matchMode === `before`) {
                result.where[key] = { lt: value.value };
            }

            if (value.matchMode === `dateAfter` || value.matchMode === `after`) {
                result.where[key] = { gt: value.value };
            }

            if (!result.where[key]) {
                result.where[key] = { [value.matchMode]: value.value };
            }
        }
    });
    return result;
};

export const mapLazyLoadEventToPrisma = (event: LazyLoadEvent) => {
    let result = {
        skip: event.first,
        take: event.rows,
    };

    if (event.filters) {
        const filterParams = mapPrimengFilterParamsToPrisma(event.filters);

        if (filterParams) {
            result = {
                ...result,
                ...filterParams,
            };
        }
    }

    if (event.sortField) {
        const sortParams = mapSortChangeToPrisma({
            mode: `single`,
            field: event.sortField,
            order: event.sortOrder,
        });

        if (sortParams) {
            result = {
                ...result,
                ...sortParams,
            };
        }
    }

    if (event.multiSortMeta) {
        const multiSortParams = mapSortChangeToPrisma({
            mode: `multiple`,
            multiSortMeta: event.multiSortMeta,
        });

        if (multiSortParams) {
            result = {
                ...result,
                ...multiSortParams,
            };
        }
    }
    return result;
};
