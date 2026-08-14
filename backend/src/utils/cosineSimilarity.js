const cosineSimilarity = (
    vectorA,
    vectorB
) => {

    if (
        !vectorA ||
        !vectorB ||
        vectorA.length === 0 ||
        vectorB.length === 0
    ) {
        return 0;
    }

    if (
        vectorA.length !== vectorB.length
    ) {
        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (
        let i = 0;
        i < vectorA.length;
        i++
    ) {

        dotProduct +=
            vectorA[i] * vectorB[i];

        magnitudeA +=
            vectorA[i] * vectorA[i];

        magnitudeB +=
            vectorB[i] * vectorB[i];

    }

    if (
        magnitudeA === 0 ||
        magnitudeB === 0
    ) {
        return 0;
    }

    return (
        dotProduct /
        (
            Math.sqrt(magnitudeA) *
            Math.sqrt(magnitudeB)
        )
    );

};

export default cosineSimilarity;