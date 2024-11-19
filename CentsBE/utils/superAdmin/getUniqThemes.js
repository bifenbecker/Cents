const getUniqThemes = (businessTheme, storeThemes) => {
    const allUniqThemes = [
        {
            primaryColor: businessTheme.primaryColor,
            borderRadius: businessTheme.borderRadius,
            logoUrl: businessTheme.logoUrl,
            appliedTo: [businessTheme],
        },
    ];

    storeThemes.forEach((theme) => {
        const isExistingThemeIndex = allUniqThemes.findIndex(
            (uniqTheme) =>
                theme.primaryColor === uniqTheme.primaryColor &&
                theme.borderRadius === uniqTheme.borderRadius &&
                theme.logoUrl === uniqTheme.logoUrl,
        );

        if (isExistingThemeIndex >= 0) {
            allUniqThemes[isExistingThemeIndex].appliedTo.push(theme);
        } else {
            allUniqThemes.push({
                primaryColor: theme.primaryColor,
                borderRadius: theme.borderRadius,
                logoUrl: theme.logoUrl,
                appliedTo: [theme],
            });
        }
    });

    return allUniqThemes;
};

module.exports = exports = getUniqThemes;
