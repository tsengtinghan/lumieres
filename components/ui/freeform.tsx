import { Textarea } from "./textarea";
import { Button } from "./button";
import { on } from "events";
interface FreeFormProps {
    textRef: React.RefObject<HTMLTextAreaElement>
  }
  
  export default function FreeForm({ textRef }: FreeFormProps) {
    const onClick = () => {
      console.log(textRef.current?.value);
    };
  
    return (
      <div className="grid w-full gap-2">
        <Textarea placeholder="Type your answer here" ref={textRef} />
        <Button onClick={onClick}>Submit</Button>
      </div>
    );
  }