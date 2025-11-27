import makeData from '@/pages/datasets/make';
import categoryData from '@/pages/datasets/category';

export const transformMakesData = () => {
    return makeData.map(make => ({
        ID: make.ID,
        NAME: make.NAME,
        IS_ACTIVE: make.IS_ACTIVE,
        STATUS: make.IS_ACTIVE ? 'active' : 'inactive',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
    }));
};

export const transformCategoriesData = () => {
    return categoryData.map(category => ({
        CAT_ID: category.CAT_ID,
        NAME: category.NAME,
        DESCRIPTION: category.DESCRIPTION,
        TYPE: category.TYPE,
        IS_ACTIVE: true, // Default since your dataset doesn't have this field
        STATUS: 'active',
        CREATED_AT: new Date().toISOString(),
        UPDATED_AT: new Date().toISOString()
    }));
};
