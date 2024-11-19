module.exports = exports = function mapRegions(regions) {
    const mappedObject = [];
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        for (let j = 0; j < region.districts.length; j++) {
            const district = region.districts[j];
            const mappedDistrict = {
                id: district.id,
                name: district.name,
                regionId: region.id,
                regionName: region.name,
                isRegionDeleted: region.isDeleted,
                isDistrictDeleted: district.isDeleted,
            };
            mappedObject.push(mappedDistrict);
        }
    }
    return mappedObject;
};
