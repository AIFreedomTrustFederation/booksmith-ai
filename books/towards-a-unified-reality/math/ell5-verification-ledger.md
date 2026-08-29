# ℓ = 5 Verification Ledger

This file is the reproducibility target for the exact invariant-theory claims used in the monograph. It is deliberately a ledger rather than a fabricated computer-algebra transcript. A future CAS notebook must reproduce these identities from the declared real spherical-harmonic and Clebsch–Gordan conventions before publication proof is frozen.

## Frozen exact claims

- `dim Inv_2(V_5) = 1`
- `dim Inv_3(V_5) = 0`
- `dim Inv_4(V_5) = 2`
- `dim Inv_5(V_5) = 0`
- `dim Inv_6(V_5) = 6`

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

Intrinsic derivatives on the quartic constrained manifold:

`dJ(U) = dJ(V) = 0`

`d^2J(U,U) = d^2J(V,V) = 72/143`

`d^2J(U,V) = 0`.

For normalized shape directions, the Hessian is

`H_shape(J_{4,8}) = (336/715) I_2 > 0`.

## Second-order constraint correction to reproduce

For a constrained path in tangent direction `U`, use

`A(eps) = A_* + eps U + 1/2 eps^2 W_U + O(eps^3)`.

The unit-sphere condition requires

`<A_*, W_U> = -||U||^2`.

The quartic-minimum constraint requires

`DB_2(A_*)[W_U] + 2 P_2(U tensor U) = 0`.

Repeat for `V` and for the mixed bilinear correction used to recover the intrinsic mixed Hessian.

## Required future CAS artifact

The publication-ready verification notebook should:

1. declare the real tesseral harmonic basis and normalization;
2. declare the Clebsch–Gordan coefficient convention;
3. reconstruct every quartic channel relation exactly;
4. construct `B_2`, evaluate `B_2(A_*)`, and print the Jacobian;
5. identify and print the exact nonzero 5×5 minor;
6. construct the rotational tangent generators and verify `R^T R = 10 I_3`;
7. compute the orthogonal two-dimensional shape kernel and recover `U,V` up to basis rotation/sign;
8. construct `J_{4,8}` and solve the second-order constrained-path corrections;
9. recover the exact intrinsic derivatives `72/143` and `336/715`;
10. emit a machine-readable result file whose hashes can be cited from the manuscript provenance record.

## Deliberately open

The ledger does **not** assert the PDE-specific sixth-order reduced energy. The center-manifold/slaving calculation through the needed order remains to be derived. Algebraic resolving capability is frozen; dynamical realization is open.
