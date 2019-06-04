#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const log = console.log;
const userInfo = require('./info.json');

const { basicinfo, education, itskill } = userInfo;

function previewBasicinfo() {
  var dt = basicinfo.data
    log()
    log("  "+ chalk.green.bold(basicinfo.title + ': ' +(dt.name.val||''))  )
    log()
    log("   " + (dt.workExperience?dt.workExperience.val + '|' :'') + 
        (dt.gender?dt.gender.val + '|' :'') +
        (dt.dateOfBirth?dt.dateOfBirth.val + '|' :'') +
        (dt.maritalStatus?dt.maritalStatus.val + '|' :'') +
        (dt.height?dt.height.val :'') )

    log("   ----------------------------");
    if(dt.hukou)log("   " + dt.hukou.info + " : " + dt.hukou.val);
    if(dt.residency)log("   " + dt.residency.info + " : " + dt.residency.val);
    if(dt.nation || dt.region || dt.currentCity || dt.postalCode){
        var address = '' + (dt.nation.val||'') + ' ' +
            (dt.currentCity.val || '') + ' ' + 
            (dt.postalCode.val?' (邮编: '+dt.postalCode.val+')':'');

        log("   地　址 : "+ address);
    }
    if(dt.mobile)log("   " + dt.mobile.info + " : " + dt.mobile.val);
    if(dt.email)log("   " + dt.email.info + " : " + dt.email.val);
    if(dt.website)log("   " + dt.website.info + " : " + dt.website.val);
    log()
}

//教育经历  预览
function previewEducation(){
  var edu = education.data;
  log()
  log(" "+chalk.green.bold(education.title))
  for (var i = 0; i < edu.length; i++) {
      for(var a in edu[i]){
          if(a === "timePeriod") log(),
              log("   " + chalk.red('■ ') + edu[i][a].val),
              log("   ----------------------------");
          else log("   " + chalk.red('› ') + edu[i][a].info + " : " + edu[i][a].val);
      }
  };
  log()
}

//IT技能  预览
function previewItskill(){
  var its = itskill.data;
  log()
  log(" "+chalk.green.bold(itskill.title))
  log()
  for (var i = 0; i < its.length; i++) {

      var txt = ''

      for(var a in its[i]){
          if(its[i][a]) {
              txt += a + ':' + its[i][a] + ' | ';
              // log("   ■ " + (its[i][a]? a + ':' + its[i][a]:"") )
          }
      }
      log("   " + chalk.red('■ ') + txt)
      // log("   ----------------------------");
  };
  log()
}

//错误处理
function errorUndefine(options,alias){
  log()
  log("   fs:"+"'"+alias+"'"+" is not a wcj command. See 'wcj "+options._alias+" --help'.")
  log()
}

module.exports = function(options) {
  if(options === 'preview'){
      //提供可选参数预览简历
      previewBasicinfo();
      previewEducation();
      previewItskill();
  }else if(options.basicinfo){
      //基本信息
      previewBasicinfo();
  }else if(options.education){
      //教育经历预览
      previewEducation();
  }else if(options.itskill){
      //IT技能 预览
      previewItskill();
  }else{
      //如果没有任何参数就是预览简历
      previewBasicinfo();
      previewEducation();
      previewItskill();
  }
};
