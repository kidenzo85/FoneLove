async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/dashboard-stats?requesterId=cmpd5tirc0000l504g7gjdqsq');
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (e) {
    console.error(e);
  }
}
test();
