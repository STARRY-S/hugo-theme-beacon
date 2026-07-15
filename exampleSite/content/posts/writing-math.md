---
title: "Writing Math with LaTeX"
date: 2026-07-15T10:00:00+08:00
draft: false
tags: ["markdown", "math"]
categories: ["guides"]
description: "Beacon typesets LaTeX at build time with KaTeX — no client-side JavaScript."
---

Beacon supports LaTeX math. Equations are typeset **at build time** with KaTeX
(via Hugo's `transform.ToMath`), so no JavaScript is shipped to readers — the
KaTeX stylesheet is only included on pages that actually contain math.

## Inline math

Wrap inline expressions in `\(` and `\)`. For example, the identity
\(e^{i\pi} + 1 = 0\) holds, and the golden ratio is
\(\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.618\).

Plain dollar signs are left alone, so writing about a $5 coffee or a $10
lunch is safe.

## Display math

Use `$$ … $$` (or `\[ … \]`) for display equations:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

Aligned environments work too:

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

Wide equations scroll horizontally inside the card instead of overflowing on
small screens:

$$
f(a) = \frac{1}{2\pi i} \oint_{\gamma} \frac{f(z)}{z - a} \, dz
\qquad
\binom{n}{k} = \frac{n!}{k!(n-k)!}
\qquad
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

## Enabling it

Math is off by default. Turn it on by enabling Goldmark's passthrough
extension in your site config:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

Single-dollar inline delimiters (`$…$`) are deliberately not part of the
recommended setup, since they collide with ordinary prose about prices.
