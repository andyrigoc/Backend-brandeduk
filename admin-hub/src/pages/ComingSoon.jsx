import React from 'react';
import { Card, Result, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const ComingSoon = ({ title, description }) => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <Card>
        <Result
          icon={<ToolOutlined style={{ color: '#00838f' }} />}
          title="Coming Soon"
          subTitle={description || `The ${title} page is under development.`}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      </Card>
    </div>
  );
};

export default ComingSoon;
