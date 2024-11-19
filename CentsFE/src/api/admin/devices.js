import httpClient from './../httpClient';

export const fetchDevices = (businessId, params) => {
    return httpClient({
        method: 'GET',
        url: `super-admin/business-owners/${businessId}/devices`,
        params
    });
};

export const fetchBatches = ({ businessId }) => {
    return httpClient({
        method: 'GET',
        url: `super-admin/business-owners/${businessId}/batches`,
    });
}

export const uploadDevices = params => {
    return httpClient({
        method: 'POST',
        url: 'super-admin/devices',
        headers: {
            'content-type': 'multipart/form-data'
        },
        data: params
    });
};