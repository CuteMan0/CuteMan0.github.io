---
title: 状态机（State Machine）
description: 奇妙的FSM
date: 2025-04-27
tags: [FSM,C]
categories: [Software]
---

## 引

简单说，**状态机**就是一种在不同状态之间**切换**，并根据**当前状态**和**输入**决定行为的模型。

可以理解成这样的一套东西：(假若我是一台CD机)

一组状态（比如：Idle、Playing、Paused）

一组事件/输入（比如：Start 按钮按下、Pause 按钮按下）

一组转移规则（比如：在 Idle 状态下按 Start -> 切到 Playing）

一些动作（状态变化时要做什么，比如初始化资源、更新界面）

| 当前状态 | 输入事件 | 下一个状态 | 动作         |
| -------- | -------- | ---------- | ------------ |
| Idle     | 点击播放 | Playing    | 开始播放音乐 |
| Playing  | 点击暂停 | Paused     | 暂停音乐     |
| Paused   | 点击播放 | Playing    | 继续播放     |
| Playing  | 播放结束 | Idle       | 回到初始状态 |

状态机的核心就是：“**状态 + 输入 → 动作 & 新状态**”


### 表驱动状态机

显然，我们可以使用 **C** 中的数组来实现如此一个状态机的**转移表**：

```c
typedef void (*pfState)(void);

typedef enum eEvent {
    EVT_NO_EVENT,
    EVT_Start_PRESSED,
    EVT_Pause_PRESSED,
    EVT_END
} eEvent;

typedef struct stStmRow {
    pfState  pSrcState;
    eEvent        eEvt;
    pfState pDestState;
} StmRow_t;

// 定义状态函数
void stateIdle(void);
void statePlaying(void);
void statePaused(void);

static eEvent      eCurrentEvent       = EVT_NO_EVENT;
static pfState     pfCurrentState      = stateIdle;

// 状态事件表
StmRow_t  stm[]= {
{stateIdle     , EVT_Start_PRESSED , statePlaying },
{statePlaying  , EVT_Pause_PRESSED , statePaused  },
{statePaused   , EVT_Start_PRESSED , statePlaying },
{statePlaying  , EVT_END           , stateIdle    }
};
```

通过 `StateMachineHandler` 查询判断 `pfCurrentState` 和 `eCurrentEvent` 与 `stm` 中的是否匹配，如果匹配，则执行相应的动作，并切换到下一个状态。当然需要为状态添加进入和离开的动作：

```c
static bool bIsStateFirstEntry  = false;
static bool bIsStateAboutToExit = false;

void stateIdle(void)
{
    if(bIsStateFirstEntry) {
        // 处理初次进入，进行相关初始化
    }

    // ...

    if(bIsStateAboutToExit) {
        // 处理离开状态，比如释放内存，复位寄存器等
    }
}

void StateMachineHandler()
{
    int idx = 0;
    if(EVT_NO_EVENT != eCurrentEvent) {
        for(;idx < sizeof(stm)/sizeof(StmRow_t); idx++) {
            if( (stm[idx].pSrcState == pfCurrentState) &&
                (stm[idx].eEvt      == eCurrentEvent)) {
                eCurrentEvent  = EVT_NO_EVENT;
                bIsStateAboutToExit = true;
                pfCurrentState();
                // 更新状态
                pfCurrentState = stm[idx].pDestState;
                bIsStateFirstEntry = true;
            }
        }
    }

    if(NULL != pfCurrentState) {
        pfCurrentState();
        bIsStateFirstEntry = false;
    }
}
```


### 事件驱动状态机

需要提及的是，上文表驱动状态机的实现较繁琐，一般不会应用在如此简单的状态机中。
- 最快速的写法：

```c
void CD_Handler()
{
    if(Start_pressed) {
        // 🎵 Playing
    }
    if(Pause_pressed) {
        // ⏸ Paused
    }
    if(Play_End) {
        // 💤 Idle
    }
}
```

这样的代码**隐式**的描述了状态机，而且存在逻辑隐患，查询效率低。

- 普遍的的 `switch-case` 示例：

```c
void CD_Switcher()
{
    switch (fsm->current_state) {
        case Idle:
            if (event == Start_pressed) {
                playing_actions();
                fsm->current_state = Playing;
            }
            break;
        case Playing:
            if (event == Pause_pressed) {
                paused_actions();
                fsm->current_state = Paused;
            } else if (event == Play_End) {
                idle_actions();
                fsm->current_state = Idle;
            }
            break;
        // 其他状态...
    }
}
```

这样看起来似乎清晰一点，但是直接扔进主循环中会导致CPU一直在查询状态机，严重阻塞其他任务。因此，引入**事件驱动状态机**，当有事件发生时，再进行状态切换：

```c
    eEvent event = dequeue(fsm->event_queue);
    if(event != No_event) {
        CD_Switcher(fsm, event);
    }
```

通过事件队列 `dequeue()` 来推动状态机的更新，从而避免CPU的轮询。同样可以在表驱动状态机中引入事件队列。

- 除了 `if-if` 这种低效实现，其他的状态机实现按照**外面调度方式**决定它是不是**阻塞**或者**打空转**。

### 业务与引擎分离状态机

回顾最初的表驱动状态机实现，`StateMachineHandler` 只负责状态切换，而业务逻辑则由状态函数 `stateIdle` 实现。两者解耦，互不污染，互不强依赖。

将具体的业务主体（CD机）与状态机引擎分离，状态机引擎只负责状态切换，业务主体则负责具体的业务逻辑。这样，状态机引擎可以复用，而业务主体则可以专注于自己的业务逻辑。

表驱动的显著优点是：**可读性强**，状态转移规则明确地写在转移表中。  
——但是，当状态机非常复杂、动态转移多时，转移表也可能变得非常庞大、难以维护。

提供完全分离的业务与引擎：

- [简单的状态机引擎和业务逻辑分离的框架](https://github.com/CuteMan0/fsm)

但这并不能直接解决状态转移表过于庞大、难以维护的问题，业务逻辑会随着状态的增加而膨胀。需要在此架构中创建子状态机，将状态转移表拆分到各个状态机中。同时需要将行为动作从状态函数中剥离出来。