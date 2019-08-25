# sync-react
data synchronize for react

# Use
```ts
import {sync}  from "@cqrsfk/sync-react";

class UI extends React.Component{
    async componentWillMount() {
      this.userProto = await domain.create<User>("User", []);
      this.ud = sync(this, "user");
      const user = this.userProto.$sync(this.ud);
      this.setState({
        user
      });
    }
}

```