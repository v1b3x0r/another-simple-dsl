# Dreamflow Sandbox (super alpha)
Sanbox ที่โคตรเล็กแบบชิบหาย 555 สำหรับทดสอบ DSL ที่เข้าใจ แต่มันก็ Wokrs 😅 ค่อยๆอ่านนะ ไม่กี่บรรทัดก็เข้าใจแล้ว

## ทำความเข้าใจก่อน กันงง 555555
1. 

```bash
bun i install
bun dev

# run unit tests
bun run test
```

เปิด `http://localhost:5173` แล้วลองกดปุ่มเพื่อข้าม layer ต่างๆ พร้อมดู state log ใน DevTools console

## DSL Cheat Sheet

```dsl
world Inception {
  scene lobby {
    description: "ฐานบัญชาการ neon"
    hint: "เลือกเส้นแล้วไปให้สุด"
    actions: ["user.enterLayerOne", "user.takeWeirdSlide"]
  }

  @flow when user.enterLayerOne leadsTo goto("layer1")
  @effect when user.grabGreenBox leadsTo reveal("greenBox")
  @guard when user.warpToFinalGate and greenBox >= 1 and redBox >= 1 leadsTo goto("finalGate")
}
```

- `world <name> { ... }` ระบุ scope ของ flow
- `scene <id> { description, hint?, actions[] }` = Single Source of Truth ของ UI
- `@flow/@guard/@effect` คือ annotation ใน rule (ถ้าไม่ระบุ default = `flow`)
- `goto("sceneId")` เปลี่ยนฉาก, `reveal("counterName")` เพิ่มค่า state counter

## Engine Features

- Parser แยก world/scenes/rules พร้อมดึง hint/action list ให้ UI render อัตโนมัติ
- DreamEngine มี evaluator สำหรับ condition (`scene`, counters, และเปรียบเทียบตัวเลข) พร้อม effect registry (`goto`, `reveal`, `announce`, `finish`, ฯลฯ)
- Journey tracker + HUD โชว์ layer ปัจจุบัน, counters (ของที่เก็บ) และข้อความจากระบบ

## Next Steps

- เปิด API ให้ register effect เพิ่มเติมแบบ plugin + ตัวช่วยตรวจ type
- ทำ CLI lint/dry-run DSL
- ขยายเอกสาร + sample world ใหม่ (signup flow, tutorial ฯลฯ)
