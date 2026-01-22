import { useEffect } from "react";

export default function Admin_EngTools({ addNameToNavBar=null }) {
  
  useEffect(() => {
    if (addNameToNavBar) {
      addNameToNavBar("Engineering Tools");
    }
  }, [addNameToNavBar]);

  return (
    <div id="admin-eng-tools">
      hello I am some content
    </div>
  );
}
