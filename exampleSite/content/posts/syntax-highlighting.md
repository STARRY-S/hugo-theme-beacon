---
title: "Syntax Highlighting Showcase"
date: 2026-07-11T09:00:00+08:00
draft: false
tags: ["code", "highlighting", "demo"]
categories: ["guides"]
description: "A reference post showing how Pascal renders fenced code blocks across many languages, with the copy button and light/dark syntax colors."
---

This post demonstrates how Pascal highlights fenced code blocks. Every block
below has a one-click **copy** button, and the colors adapt to light and dark
mode (GitHub in light, GitHub Dark in dark).

Inline code like `const x = 42;` and a shell command such as `hugo --gc` also
get the subtle code styling.

## C

```c
#include <stdio.h>

// Compute factorial recursively
long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main(void) {
    for (int i = 0; i < 5; i++) {
        printf("%d! = %ld\n", i, factorial(i));
    }
    return 0;
}
```

## Python

```python
from dataclasses import dataclass


@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


if __name__ == "__main__":
    pts = [Point(0, 0), Point(3, 4)]
    print(f"distance = {pts[0].distance_to(pts[1])}")  # 5.0
```

## JavaScript

```javascript
// Debounce a function by `wait` milliseconds
function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

const log = debounce((msg) => console.log(`[${Date.now()}] ${msg}`), 200);
["a", "b", "c"].forEach(log);
```

## TypeScript

```typescript
interface User {
  id: number;
  name: string;
  roles: readonly string[];
}

const isAdmin = (user: User): boolean =>
  user.roles.includes("admin");

const jane: User = { id: 1, name: "Jane", roles: ["admin", "editor"] };
console.log(isAdmin(jane)); // true
```

## Go

```go
package main

import "fmt"

func fib(n int) int {
	a, b := 0, 1
	for i := 0; i < n; i++ {
		a, b = b, a+b
	}
	return a
}

func main() {
	for i := 0; i < 10; i++ {
		fmt.Printf("%d ", fib(i))
	}
}
```

## Rust

```rust
fn main() {
    let nums = vec![1, 2, 3, 4, 5];
    let sum: i32 = nums.iter().filter(|&&n| n % 2 == 1).sum();
    println!("sum of odds = {sum}");
}
```

## YAML

```yaml
# CI pipeline
name: build
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: hugo --gc --minify
```

## JSON

```json
{
  "name": "pascal",
  "version": "0.1.0",
  "features": ["dark-mode", "sidebar", "i18n"],
  "config": {
    "iconify": true,
    "sidebar": { "enabled": true, "position": "left" }
  }
}
```

## Bash

```bash
#!/usr/bin/env bash
set -euo pipefail

# Build and preview the site
cd exampleSite
hugo server --disableFastRender &
echo "Serving on http://localhost:1313"
```

## SQL

```sql
SELECT u.name, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.author_id = u.id
WHERE u.active = TRUE
GROUP BY u.name
ORDER BY post_count DESC
LIMIT 10;
```

## HTML

```html
<figure class="card">
  <img src="/images/cover.png" alt="Cover" loading="lazy" />
  <figcaption>A responsive card component</figcaption>
</figure>
```

## CSS

```css
.card {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius);
  background: var(--color-bg-soft);
}
```

## Plain text (no language)

```
No language hint means no token colors — just the monospace code styling
and the copy button.
```

That's the full tour. Any language Chroma supports will highlight the same way.
