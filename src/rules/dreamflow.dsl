scene lobby {
  description: "ฐานบัญชาการเด็กๆ ปี 2025 โต๊ะมีสติ๊กเกอร์ neon บอกชัดๆ ว่าเลือกประตูแล้วรับผิดชอบเองนะ"
  actions: ["user.enterLayerOne", "user.takeWeirdSlide"]
}

scene layer1 {
  description: "ป้อมผ้าห่มกับไฟแฟร์รี่ เด็กทุกคนมีกล่องสีเขียวคนละใบแต่ใบของเราเปิดอยู่"
  actions: ["user.grabGreenBox", "user.slideToLayerTwo", "user.resetToLobby"]
}

scene layer2 {
  description: "โรงรถที่มี jukebox กับลิฟต์เสีย ถ้าเคาะจังหวะถูกจะเกิดประตู glitch"
  actions: ["user.knockWeirdPanel", "user.openLayerThreeDoor", "user.bounceToLobby"]
}

scene layer3_glitch {
  description: "ทางเดินกระจกที่วนลูปเอง แอบมีล็อกเกอร์ซ่อนกุญแจของชั้น 3"
  actions: ["user.snatchKeyThree", "user.ghostExit"]
}

scene layer3 {
  description: "สวนน้ำตรงข้ามผนังกราฟิตี้ กล่องสีแดงอยู่กลางเวที ต้องมี key ก่อนถึงเข้าได้แบบเนียนๆ"
  actions: ["user.collectRedBox", "user.warpToFinalGate", "user.dropToLayerTwo"]
}

scene finalGate {
  description: "ประตูสีแดง-เขียวรวมร่าง เขียนด้วยปากกาเมจิกว่า 'ได้ของครบยัง?'"
  actions: ["user.resetRun"]
}

when user.enterLayerOne leadsTo goto("layer1")
when user.takeWeirdSlide leadsTo goto("layer2")

when user.grabGreenBox leadsTo reveal("greenBox")
when user.slideToLayerTwo leadsTo goto("layer2")
when user.resetToLobby leadsTo goto("lobby")

when user.knockWeirdPanel leadsTo goto("layer3_glitch")
when user.openLayerThreeDoor and scene == "layer2" and keyLayer3 >= 1 leadsTo goto("layer3")
when user.bounceToLobby leadsTo goto("lobby")

when user.snatchKeyThree leadsTo reveal("keyLayer3")
when user.ghostExit leadsTo goto("layer2")

when user.collectRedBox leadsTo reveal("redBox")
when user.warpToFinalGate and greenBox >= 1 and redBox >= 1 leadsTo goto("finalGate")
when user.dropToLayerTwo leadsTo goto("layer2")

when user.resetRun leadsTo goto("lobby")
