const challengeStore = new Map();

const ChallengeStore = {
    set(userId, challenge) {
        challengeStore.set(userId, { challenge, timestamp: Date.now() });
    },
    get(userId) {
        return challengeStore.get(userId);
    },
    delete(userId) {
        challengeStore.delete(userId);
    }
};

module.exports = ChallengeStore;
