---
title: 如何备份博客
description: 如何将博客在不同电脑之间迁移
date: 2025-06-24
tags: [GitHub, Hexo]
categories: [笔记]
---

## 引

考虑到因为系统重装，新机组装等原因，导致博客丢失 ~~我已经丢失过了~~，因此记录一下如何备份博客。


## 在旧机需要做的工作

在旧机器系统重装或者弃置前，我们还需要做一些保存备份工作。

### 创建 GitHub 备份分支

在博客仓库中创建一个备份分支，用于保存博客的源文件。
以下是推送备份分支的shell，来自于[Hexo博客备份和迁移](https://www.bilibili.com/video/BV13g41147yV/?spm_id_from=333.337.search-card.all.click&vd_source=fa5c316d2c4d5db6b77e918d42ade3c4)。

```shell
echo -e "\033[32m正在为你备份博客中.........\033[0m"
git add .
echo -e "\033[32m正在为你备份博客中.........\033[0m"
git commit -m "update"
echo -e "\033[32m正在为你备份博客中.........\033[0m"
git push origin hexo --force
if [ $? -ne 0 ]; then
    echo -e "\033[31m 备份失败！请检查网络情况！ \033[0m"
else
    echo -e "\033[32m恭喜你！已为你备份到你的GitHub仓库 backup \033[0m"
fi
```

### 备份ssh密钥

记得`保存`ssh密钥，以便与GitHub仓库建立连接。当然也可以重新在GitHub上`重新配置`ssh密钥。

## 在新机需要做的工作

### 安装[Git](https://git-scm.com/downloads)

在[Git](https://git-scm.com/downloads)官网下载安装包，安装Git。安装完成后可以在cmd中输入`git --version`查看是否安装成功。

具体操作和教程可以参考[给傻子的Git教程](https://www.bilibili.com/video/BV1Hkr7YYEh8/?spm_id_from=333.337.search-card.all.click)。

### 安装[nodejs](https://nodejs.org/zh-cn)

在[nodejs](https://nodejs.org/zh-cn)官网下载安装包，安装nodejs。下载完成后可以在cmd中输入`node -v`和`npm -v`查看是否安装成功。

#### 设置环境变量和路径
在 nodejs 文件夹中新建两个空文件夹`node_global`和`node_cache`，分别用于存放全局模块和缓存模块。打开cmd，输入如下两个命令：

```shell
npm config set prefix "nodejs文件夹路径\node_global"
npm config set cache "nodejs文件夹路径\node_cache"
```
打开`控制面板`->`系统和安全`->`系统`->`高级系统设置`->`环境变量`，在`系统变量`中找到`Path`，新建`nodejs文件夹路径\node_global\node_modules`，点击`确定`，保存设置。

然后编辑用户变量中的`Path`，将原npm的路径改为`nodejs文件夹路径\node_global`，点击`确定`，保存设置。

#### 安装webpack

在 cmd 命令下执行：
```shell
npm install webpack -g 
```

### 安装Hexo

安装完nodejs之后，可以使用npm安装hexo框架。在博客文件夹中右击选择 Git Bash Here，输入以下命令：

```shell
npm install -g hexo-cli
```

### git clone 博客的备份分支

把之前旧机的备份分支clone到本地，此时要注意要切换到`备份分支`，而不是hexo渲染推送的主分支。

```shell
git clone git@github.com:yourname/yourname.github.io.git
```

进入博客文件夹，执行以下命令：

```shell
npm install
```

OK，至此，新机上的博客已经迁移完成。

#### ~~git clone 主题~~

主题应该会自动被 npm install 一起生成的，如果主题没有安装成功，可以手动安装。