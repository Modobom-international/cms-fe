import { EditorElement } from "@/providers/editor/editor-provider";

import Container from "./container";
import LinkComponent from "./link-component";
import TextComponent from "./text";
import VideoComponent from "./video";

type Props = {
  element: EditorElement;
};

const Recursive = ({ element }: Props) => {
  switch (element.type) {
    case "text":
      return <TextComponent element={element} />;
    case "container":
      return <Container element={element} />;
    case "video":
      return <VideoComponent element={element} />;
    case "contactForm":
      return <div>Contact Form</div>;
    case "paymentForm":
      return <div>Payment Form</div>;
    case "2Col":
      return <Container element={element} />;
    case "__body":
      return <Container element={element} />;

    case "link":
      return <LinkComponent element={element} />;
    default:
      return null;
  }
};

export default Recursive;
