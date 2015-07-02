#Project Lamando Handbook

##背景说明
本项目为配合CMS系统的录入，采用了Jekyll作为静态页面生成的引擎，将静态页面生成后，再将其源码贴入CMS系统，此举避免了在制作过程中大量的重复代码的粘贴工作，所有重复代码在jekyll中采用include方式引用，并静态生成。

##运行所需环境
1. ruby

  - compass
  - jekyll

2. node.js

  - bower

##启动项目
3. `bower install`
4. `gulp start`