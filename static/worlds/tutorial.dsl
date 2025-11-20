world Tutorial {
  scene welcome {
    description: "ยินดีต้อนรับสู่ DreamTheater! ที่นี่คุณจะได้เรียนรู้พื้นฐานของการผจญภัย"
    hint: "เริ่มต้นด้วยการกดปุ่มใดก็ได้"
    actions: ["user.start", "user.skipTutorial"]
  }

  scene learnActions {
    description: "การกระทำ (Actions) คือสิ่งที่คุณสามารถทำได้ในแต่ละฉาก"
    hint: "ลองกดปุ่มต่างๆ ดู"
    actions: ["user.understand", "user.confused", "user.goBack"]
  }

  scene learnCounters {
    description: "Counters ใช้เก็บสิ่งของหรือความคืบหน้า ลองเก็บดาวดู!"
    hint: "เก็บดาวให้ครบ 3 ดวง"
    actions: ["user.collectStar", "user.checkProgress", "user.goBack"]
  }

  scene learnGuards {
    description: "บางฉากต้องการเงื่อนไขก่อนเข้า ลองเข้าประตูดู"
    hint: "ต้องมีดาวอย่างน้อย 3 ดวง"
    actions: ["user.tryEnter", "user.goBack"]
  }

  scene success {
    description: "🎉 ยินดีด้วย! คุณเรียนรู้พื้นฐานครบแล้ว"
    hint: "พร้อมไปผจญภัยจริงหรือยัง?"
    actions: ["user.restart", "user.explore"]
  }

  scene playground {
    description: "นี่คือพื้นที่ทดลองเล่นเสรี ทำอะไรก็ได้!"
    hint: "ทดลองอะไรก็ได้ตามใจชอบ"
    actions: ["user.experiment", "user.backToWelcome"]
  }

  @flow when user.start leadsTo goto("learnActions")
  @flow when user.skipTutorial leadsTo goto("playground")

  @flow when user.understand leadsTo goto("learnCounters")
  @flow when user.confused leadsTo goto("learnActions")
  @flow when user.goBack leadsTo goto("welcome")

  @effect when user.collectStar leadsTo reveal("star")
  @flow when user.checkProgress and star >= 3 leadsTo goto("learnGuards")
  @effect when user.checkProgress and star < 3 leadsTo announce("ยังเก็บดาวไม่ครบ ต้องมี 3 ดวง!")

  @guard when user.tryEnter and star >= 3 leadsTo goto("success")
  @effect when user.tryEnter and star < 3 leadsTo announce("ยังไม่มีดาวพอ ต้องมี 3 ดวง!")

  @flow when user.restart leadsTo goto("welcome")
  @flow when user.explore leadsTo goto("playground")

  @flow when user.experiment leadsTo goto("playground")
  @flow when user.backToWelcome leadsTo goto("welcome")
}
