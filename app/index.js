'use strict';

var path = require('path'),
    generators = require('yeoman-generator'),
    rimraf = require('rimraf'),
    _ = require('underscore.string');

var boilerRepos = require('./boiler_repos');

module.exports = generators.Base.extend({

    constructor: function () {
        generators.Base.apply(this, arguments);
        this.argument('appname', { type: String, required: true });
        this.appname = this.appname || path.basename(process.cwd());
        this.appname = _.camelize(_.slugify(_.humanize(this.appname)));

        console.log(`You application will be created in \'${this.appname}\' folder`);
   
        this.skipInstall = this.options['skip-install'];
    },

    askForAppType: function() {
        var message = boilerRepos.map((item, index) => `(${index}) ${item.name}` ).join('\n');
        var prompts = [{
            type: 'input',
            name: 'appType',
            message: `Choose a project type: \n${message}`,
            default: 0
        }];
    
        return this.prompt(prompts)
        .then(function(props){
            if (boilerRepos[props.appType]) {
                this.gitFolder = boilerRepos[props.appType].repo;
            } else {
                throw(new Error('Invalid input'));
            }
        }.bind(this));
    },
    
    install: function() {
        this.spawnCommandSync('git', ['clone', '--depth=1', this.gitFolder, this.appname]);
    },

    end: function() {
        process.chdir(this.appname);
        rimraf.sync('.git', {});
        
        if( !this.skipInstall){
            this.npmInstall();
        }else{
            console.log('-> You should run `npm install` now.');
        }
    }
});
