---
title: 串口重定向
description: 从“让它能说话”到“让它说得更像人”
date: 2025-04-25
tags: [MCU, UART]
categories: [笔记]
---

## 引

在调试那台陈旧的开发板时，我又一次陷入了沉默。板子没有屏幕，没有操作系统，甚至连个像样的日志系统都没有。每次出问题，就像在黑暗中摸索，无声无感。

直到我第一次把 `printf` 重定向到了串口。那一刻，像是开发板终于开了口，说：“我在跑主循环了！”、“我卡在初始化了！”、“你给的地址不对！”

那种感觉，就像是教会了婴儿说话，或者黑夜里点亮了一盏灯。从此之后，每一个字节的输出，都是我和它之间最真实的对话。


## 正文

- `GCC` 需添加编译指令 `-Wl,-u_printf_float` ，输出浮点数

- `Keil` 需启用 `micro lib`

### HAL库

- h文件
```c
#define __GCC__
#define USARTx_HANDLE huart1

#ifdef __GCC__
int __io_putchar(int ch);
int _write(int file, char *ptr, int len);
#else
int fputc(int ch, FILE *f);
#endif
```

- c文件
```c
#include <stdio.h>
#ifdef __GCC__
int __io_putchar(int ch)
{
    HAL_UART_Transmit(&USARTx_HANDLE, (uint8_t *)&ch, 1, HAL_MAX_DELAY);
    return ch;
}
int _write(int file, char *ptr, int len)
{
    int DataIdx;
    for (DataIdx = 0; DataIdx < len; DataIdx++) {
        __io_putchar(*ptr++);
    }
    return len;
}
#else
int fputc(int ch, FILE *f)
{
    HAL_UART_Transmit(&USARTx_HANDLE, (uint8_t *)&ch, 1, HAL_MAX_DELAY);
    return ch;
}
```

### LL库

与 `HAL库` 类似，将 `huart1` 改为 `USART1`，`LL库` 不使用句柄。此外，更改串口发送函数。

```c
- h文件
#define USARTx_HANDLE USART1
- c文件
    LL_USART_TransmitData8(USARTx, (uint8_t)ch);
    while (!LL_USART_IsActiveFlag_TXE(USARTx))
        ;
```

### STD库

与 `LL库` 类似，不使用句柄，仅更改串口发送函数。

```c
- c文件
    USART_SendData(USARTx, (u8)ch);
    while (USART_GetFlagStatus(USARTx, USART_FLAG_TXE) == RESET)
        ;
```

### 寄存器

同上。

```c
- c文件
    while ((USARTx->SR & 0X40) == 0)
        ;
    USARTx->DR = (uint8_t)ch;
```
