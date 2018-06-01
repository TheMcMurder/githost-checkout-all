const axios = require('axios')
const config = require('../config.json')
const git = require('simple-git')

axios.defaults.headers.common['PRIVATE-TOKEN'] = config.key

fetchAllPackages().then(packages => {
  const frontend = packages.filter((package) => {
    return package.name_with_namespace.indexOf('front-end') !== -1
  })
  for (let i = 0; i < frontend.length; i++) {
    const repo = frontend[i]
    console.info(`Pulling ${repo.name}`)
    git(config.path).clone(repo.ssh_url_to_repo, function(err, data) {
      if (err && err.indexOf('already exists') !== -1) {
        console.info(`${repo.name} already exists`)
        git(`${config.path}/${repo.name}`).checkout('master').pull('origin/master')
      }
    })
  }
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
