import fs from 'fs';
import Promise from 'bluebird';
import path from 'path';

let readFile = Promise.promisify(fs.readFile),
    writeFile = Promise.promisify(fs.writeFile);



const configHelper = () => {

  let innerRepresentation;

  let getData = () => {

    if(!innerRepresentation || innerRepresentation.changed) {
      return readFile(path.join(process.cwd(), 'configuration.JSON'), 'utf8')
      .then(data => JSON.parse(data))
      .then(config => {
        innerRepresentation = config;
        return config;
      })
      .catch(err => {
        return err;
      });
    } else {
      return new Promise(resolve => {
        resolve(innerRepresentation);
      });
    }
  }

  let getTasks = (folderName, folderPath) => {
    return getData()
    .then(config => 
      config.filter(folder => {
        if(folder.folder.name === folderName && folder.folder.path === folderPath) {
          return true;
        } else {
          return false;
        }
      }))
    .then(folder => folder[0].tasks)
    .catch(err => err);
  }

  let saveFolder = (data) => 
    getData()
    .then(config => {
      config.push(data);
      return config;
    })
    .then(config => save(config))
    .catch(err => err);

  let save = (data) => writeFile(path.join(process.cwd(), 'configuration.JSON'), JSON.stringify(data))
                        .catch(err => err);
  

  let saveTask = (folderName, folderPath, data) => 
    getData()
    .then(config => 
      config.map(folder => {
        if(folder.folder.name === folderName && folder.folder.path === folderPath) {
          if(!folder.tasks) {
            folder.tasks = [];
          }
          folder.tasks.push(data);
        } return folder;
      }))
    .then(config => save(config))
    .catch(err => err);

    let deleteTask = (folderName, folderPath) => {};
  

  let get = () => {
    return getData();
  };
  return {
    get: get,
    saveFolder: saveFolder,
    saveTask: saveTask,
    getTasks: getTasks
  }
}

module.exports = configHelper();