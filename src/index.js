const axios = require('axios')
const config = require('../config.json')
const git = require('simple-git/promise')

axios.defaults.headers.common['PRIVATE-TOKEN'] = config.key

fetchAllPackages().then(packages => {
  let nameSpacedPackages
  if (config.namespace) {
    nameSpacedPackages = packages.filter((package) => {
      return package.name_with_namespace.indexOf(config.namespace) !== -1
    })
  } else {
    nameSpacedPackages = packages
  }
  const promises = []
  const errorMessages = []
  let baseTimeout = 250
  for (let i = 0; i < nameSpacedPackages.length; i++) {
    const repo = nameSpacedPackages[i]
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, baseTimeout * i)
    }).then(() => {
      return git(config.path).silent(true).clone(repo.ssh_url_to_repo)
        .catch(err => {
          if (err.message && err.message.indexOf('already exists') !== -1) {
            console.info(`${repo.name} already exists, attempting to pull master`)
            return git(`${config.path}/${repo.path}`).silent(true).checkout('master').then((results) => {
              return git(`${config.path}/${repo.path}`).silent(true).pull('origin', 'master')
            })
          }
        })
        .then(results => {
          console.info(`Successfully pulled ${repo.path}`)
        })
        .catch(err => {
          debugger
          errorMessages.push(`an error occured while trying to clone or pull "${repo.name}": ${err}`)
        })
    })
    promises.push(promise)
  }

  Promise.all(promises).then(() => {
    if (errorMessages.length >= 1) {
      console.info('The following errors occured')
      console.info('***********')
      errorMessages.forEach((message) => {
        console.info(message)
      })
      console.info('***********')
      console.info('Process finished with errors')
    } else {
      console.info('***********')
      console.info('***********')
      console.info('Process finished without errors')
      console.info('***********')
      console.info('***********')
    }
  })


})

function fetchAllPackages () {
  let PageNum = 1
  let totalPages = 1
  let packages = []
  function handleResponse (response) {
    packages = packages.concat(response.data)
    totalPages = response.headers['x-total-pages']
  }
  return new Promise ((resolve) => {
    fetchPackages(PageNum).then(handleResponse).then(() => {
      if (PageNum >= totalPages) {
        resolve(packages)
      } else {
        const moreRequests = []
        for (let i = PageNum + 1; i <= totalPages; i++) {
          moreRequests.push(fetchPackages(i))
        }
        Promise.all(moreRequests).then((results) => {
          const allResults = results.reduce((acc, resultSet) => {
            return acc.concat(resultSet.data)
          }, [])
          packages = packages.concat(allResults)
        }).then(() => {
          resolve(packages)
        })

      }
    })
  })
}

function fetchPackages(pageNum = 1) {
  return axios.get(`${config.baseUrl}/api/v4/projects?sort=desc&page=${pageNum}&per_page=50&simple=true`)
    .then(function (response) {
      return response
    })
}
