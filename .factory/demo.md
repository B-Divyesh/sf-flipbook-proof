# Flipbook Proof demo

- URL: <https://flipbook-proof.sociobot.in/demo>
- Local URL: <http://127.0.0.1:4173/demo>
- First action: select **Try it with sample data** on the home page.

The demo opens with 12 original vector frames of a classroom pendulum moving
through one swing. It also includes onion skin, A4 paper, left binding, forward
page order, a contact sheet, and numbered trace sheets.

The banner reads **Demo — sample data, nothing is saved** on every demo screen.
Demo projects use the `demo:flipbook-proof` IndexedDB database. Demo license
values use `demo:sb_license:flipbook-proof` localStorage keys. Real storage is
never read or written while the demo banner is present.

**Reset demo** deletes the demo project and license, then creates the original
12-frame sample again. **Start for real** deletes the demo namespace and opens
the empty real workspace. It never copies sample changes into real data.
