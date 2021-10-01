const cache = {}

// Création du cache
function set(key, data) {
    cache[key] = {
        data,
        cacheAt: new Date().getTime()
    }
}

// Récuperation du cache si celui ci existe et si il est bien dans inferieure a la date de maintenant - 15 min
function get(key) {
    return new Promise(resolve => {
        resolve(cache[key] && cache[key].cacheAt +15 * 60 * 1000 > new Date().getTime() ? cache[key].data : null)
    })
}

export default {
    set,
    get
}
