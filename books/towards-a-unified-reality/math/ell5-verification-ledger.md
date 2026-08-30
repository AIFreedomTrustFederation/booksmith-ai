# ℓ = 5 Verification Ledger

This file is the reproducibility target for the exact invariant-theory claims used in the monograph. The exact values below have now been independently reproduced through a separate Molien/invariant-count implementation and a separate Clebsch–Gordan construction of the sextic witness. A publication-grade machine-readable notebook is still desirable and remains a provenance task; this ledger does not pretend that such an artifact already exists in the repository.

## Frozen exact claims

Invariant multiplicities:

- `dim Inv_0(V_5) = 1`
- `dim Inv_1(V_5) = 0`
- `dim Inv_2(V_5) = 1`
- `dim Inv_3(V_5) = 0`
- `dim Inv_4(V_5) = 2`
- `dim Inv_5(V_5) = 0`
- `dim Inv_6(V_5) = 6`

Raw symmetric-power sanity check:

- `dim Sym^d(V_5) = C(d+10,10)` for `d = 0,...,6`.

The vanishing odd-degree multiplicities at `d=3,5` are representation-specific facts for `V_5`, not a universal theorem that odd-degree `SO(3)` invariants vanish.

Primitive sextic count:

- `dim Inv_4(V_5) = 2`
- multiplication by `I_2 = ||A||^2` is injective
- `dim(I_2 Inv_4) = 2`
- `dim(Inv_6 / I_2 Inv_4) = 4`.

Quartic channel relations:

- `K_4 = (18/13) K_0`
- `K_6 = (45/17) K_0 - (143/170) K_2`
- `K_8 = (880/247) K_0 - (117/95) K_2`
- `K_10 = (777/323) K_0 + (693/646) K_2`

Reduced energy:

`F_4(A) = alpha K_0(A) + beta K_2(A)`

with

`alpha = 30241998291659 / (24945292961264 pi)`

`beta = 503273130591 / (3050785612808 pi) > 0`.

On `||A|| = 1`, `K_0 = 1/11`, and with `B_2(A) = P_2(A tensor A)`, the normalized global minimum set is

`M_4 = { A in S^10 : B_2(A) = 0 }`.

Regular point:

`A_* = sqrt(3/5) Y_50 + sqrt(2/5) Y^c_55`.

Rank certificate:

`det M = 224 sqrt(1430) / 2924207 != 0`, hence `rank DB_2(A_*) = 5`.

Local tangent structure:

`dim T_{A_*} M_4 = 5`, rotational Gram matrix `R^T R = 10 I_3`, and therefore

`5 = 3 rotation + 2 shape`.

Shape-flat basis:

`U = -sqrt(14)/14 Y^c_52 + Y^c_53`

`V = sqrt(14)/14 Y^s_52 + Y^s_53`

with `||U||^2 = ||V||^2 = 15/14` and `<U,V> = 0`.

Sextic invariant:

`J_{4,8}(A) = || P_8( P_4(A tensor A) tensor A ) ||^2`.

Independent reconstruction reproduces

`J_{4,8}(A_*) = 1/143`.

First derivatives on the quartic constrained manifold:

`dJ(U) = dJ(V) = 0`.

## Ambient versus intrinsic Hessian

The ambient straight-line second derivative is

`D^2 J(A_*)[U,U] = 547/1001`.

After normalizing `U`, the straight-line tangent contribution is

`(14/15)*(547/1001) = 1094/2145`.

This is **not** the intrinsic Hessian on `M_4`.

For a constrained path in tangent direction `U`, use

`A(eps) = A_* + eps U + 1/2 eps^2 W_U + O(eps^3)`.

The unit-sphere condition requires

`<A_*, W_U> = -||U||^2`.

The quartic-minimum constraint requires

`DB_2(A_*)[W_U] + 2 P_2(U tensor U) = 0`.

One exact solution is

`W_U = -(7 sqrt(15)/30)Y_50 + (sqrt(21)/21)Y^c_51 + (sqrt(21)/7)Y^c_54 - (13 sqrt(10)/70)Y^c_55`.

For `V`, one exact correction is

`W_V = -(7 sqrt(15)/30)Y_50 - (sqrt(21)/21)Y^c_51 - (sqrt(21)/7)Y^c_54 - (13 sqrt(10)/70)Y^c_55`.

A valid mixed correction is

`W_UV = (sqrt(21)/21)Y^s_51 - (sqrt(21)/7)Y^s_54`.

The second-fundamental-form correction is

`dJ(A_*)[W_U] = -43/1001`.

Therefore

`547/1001 - 43/1001 = 72/143`.

The exact intrinsic derivatives are

`d^2_M4 J(U,U) = d^2_M4 J(V,V) = 72/143`

`d^2_M4 J(U,V) = 0`.

For normalized shape directions

`e_1 = sqrt(14/15) U`

`e_2 = sqrt(14/15) V`,

we obtain

`H_shape(J_{4,8}) = (336/715) I_2 > 0`.

The difference between `1094/2145` and `336/715` is therefore geometric, not an inconsistency between two definitions of `J_{4,8}`: the former omits the curvature correction required to stay on `S^10 ∩ {B_2=0}`.

## Verification status

Independently reproduced exactly:

1. the Molien multiplicity sequence through degree six;
2. the raw symmetric-power dimension sanity checks;
3. `dim Inv_6 = 6`;
4. the primitive quotient dimension `4`;
5. the Clebsch–Gordan construction of `J_{4,8}`;
6. `J_{4,8}(A_*) = 1/143`;
7. the ambient value `547/1001`;
8. the curvature correction `-43/1001`;
9. the intrinsic values `72/143` and mixed value `0`;
10. the normalized shape Hessian `(336/715) I_2`.

Still desired for repository-level reproducibility:

1. a committed exact CAS notebook or script declaring the basis and Clebsch–Gordan convention;
2. machine-readable output for every frozen identity;
3. hashes cited by the publication provenance record.

## Deliberately open

The ledger does **not** assert the PDE-specific sixth-order reduced energy. The fifth-order amplitude / sixth-order energy reduction remains to be derived, including the required `w^(3)`, `w^(4)`, quadratic-feedback, cubic-feedback, and recoupling terms.

The first sharp dynamical target is the restricted intrinsic matrix

`H_6,shape^PDE = [[d^2H_6(e1,e1), d^2H_6(e1,e2)], [d^2H_6(e2,e1), d^2H_6(e2,e2)]]_M4`.

Algebraic resolving capability is closed. PDE dynamical selection remains open.
