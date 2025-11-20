world Dreamflow2025 {
  scene lobby {
    description: "ฐานบัญชาการเด็กๆ ปี 2025 โต๊ะมีสติ๊กเกอร์ neon บอกชัดๆ ว่าเลือกประตูแล้วรับผิดชอบเองนะ"
    hint: "เลือกเส้นแล้วไปให้สุด"
    actions: ["user.enterLayerOne", "user.takeWeirdSlide"]
  }

  scene layer1 {
    description: "ป้อมผ้าห่มกับไฟแฟร์รี่ เด็กทุกคนมีกล่องสีเขียวคนละใบแต่ใบของเราเปิดอยู่"
    hint: "เก็บกล่องแล้วสไลด์ไปโรงรถ"
    actions: ["user.grabGreenBox", "user.slideToLayerTwo", "user.resetToLobby"]
  }

  scene layer2 {
    description: "โรงรถที่มี jukebox กับลิฟต์เสีย ถ้าเคาะจังหวะถูกจะเกิดประตู glitch"
    hint: "ไม่มี key ก็ไป glitch ก่อน"
    actions: ["user.knockWeirdPanel", "user.openLayerThreeDoor", "user.bounceToLobby"]
  }

  scene layer3_glitch {
    description: "ทางเดินกระจกที่วนลูปเอง แอบมีล็อกเกอร์ซ่อนกุญแจของชั้น 3"
    hint: "ดึง key แล้วรีบหนี"
    actions: ["user.snatchKeyThree", "user.ghostExit"]
  }

  scene layer3 {
    description: "สวนน้ำตรงข้ามผนังกราฟิตี้ กล่องสีแดงอยู่กลางเวที ต้องมี key ก่อนถึงเข้าได้แบบเนียนๆ"
    hint: "มี key ถึงจะไม่โดนการ์ดไล่"
    actions: ["user.collectRedBox", "user.warpToFinalGate", "user.dropToLayerTwo"]
  }

  scene finalGate {
    description: "ประตูสีแดง-เขียวรวมร่าง เขียนด้วยปากกาเมจิกว่า 'ได้ของครบยัง?'"
    hint: "กด reset ถ้ายังไม่ครบ"
    actions: ["user.resetRun"]
  }

  @flow when user.enterLayerOne leadsTo goto("layer1")
  @flow when user.takeWeirdSlide leadsTo goto("layer2")

  @effect when user.grabGreenBox leadsTo reveal("greenBox")
  @flow when user.slideToLayerTwo leadsTo goto("layer2")
  @flow when user.resetToLobby leadsTo goto("lobby")

  @flow when user.knockWeirdPanel leadsTo goto("layer3_glitch")
  @guard when user.openLayerThreeDoor and scene == "layer2" and keyLayer3 >= 1 leadsTo goto("layer3")
  @flow when user.bounceToLobby leadsTo goto("lobby")

  @effect when user.snatchKeyThree leadsTo reveal("keyLayer3")
  @flow when user.ghostExit leadsTo goto("layer2")

  @effect when user.collectRedBox leadsTo reveal("redBox")
  @guard when user.warpToFinalGate and greenBox >= 1 and redBox >= 1 leadsTo goto("finalGate")
  @flow when user.dropToLayerTwo leadsTo goto("layer2")

  @flow when user.resetRun leadsTo goto("lobby")
}
