module.exports = exports = function filterRegions(regions) {
    if (!regions.length) {
        return [];
    }
    const newRegions = regions.filter((region) => region.isDeleted === false);
    for (let i = 0; i < newRegions.length; i++) {
        const currentRegion = newRegions[i];
        currentRegion.districts = currentRegion.districts.filter(
            (district) => district.isDeleted === false,
        );
    }
    return newRegions;
};
