# MathBank TikZ AI Studio

MVP dau tien cho module TikZ Studio trong MathBank.

## Chay ung dung

```bash
npm start
```

Mac dinh ung dung mo tai:

```text
http://localhost:5173
```

## Bat AI Vision (Gemini)

1. Lay API key tai https://aistudio.google.com/apikey
2. Tao file `.env` (copy tu `.env.example`) va dien:

```text
GEMINI_API_KEY=key_cua_ban
```

3. Khoi dong lai server. Khi mo app, goc panel anh se bao "AI san sang".
4. Dan/tai anh hinh Toan roi bam **Phan tich anh bang AI** -> AI sinh TikZ va tu compile preview.

Model mac dinh `gemini-2.5-flash`, doi qua `GEMINI_MODEL` trong `.env` neu can.

## Chuc nang hien co

- Dan anh tu clipboard, keo tha file anh, hoac tai anh len.
- Phan tich anh bang AI (Gemini) de sinh TikZ truc tiep tu hinh.
- Sua code TikZ bang lenh tu nhien trong panel "Sua bang lenh AI" (vd: "doi AH thanh net dut", "dua nhan C len cao hon").
- Luu hinh vao thu vien SQLite (kem anh goc, code, JSON, lop/chuong/bai/muc do); tim kiem va nap lai.
- Dong goi va xuat .tex: che do center / immini / cau hoi ex_test (trac nghiem, dung-sai, tra loi ngan) + tai file .tex bien dich duoc; xuat ca thu vien ra mot .tex.
- Chinh tuong tac tren preview: bam chon diem, keo de di chuyen, sua x/y va vi tri nhan trong inspector, an/hien diem; sua mo hinh hinh hoc roi tu sinh lai TikZ. Co Undo/Redo (Cmd/Ctrl+Z).
- Chon mau hinh hoc co ban de sinh TikZ.
- Luu mo hinh trung gian dang JSON.
- Sinh code TikZ theo style tuong thich `ex_test`.
- Compile TikZ bang `pdflatex` va chuyen sang SVG bang `dvisvgm`.
- Copy code, boc vao moi truong `ex_test`, luu vao thu vien tam tren trinh duyet.

## Yeu cau preview

May can co TeX Live voi:

```text
latex
dvisvgm
```

Neu preview compile loi, ung dung van hien preview SVG mo phong tu mo hinh hinh hoc.

## Du lieu

Thu vien hinh luu trong SQLite tai `storage/mathbank.db` (tu tao khi chay server lan dau, da gitignore). Dung module `node:sqlite` tich hop nen khong can cai them goi.
