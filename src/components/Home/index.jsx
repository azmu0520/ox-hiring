import React, { useState } from 'react';
import { FilterInput, Input, Table, Wrap } from './style';
import axios from 'axios';
import { Pagination, Space } from 'antd';
import { useProductContext } from '../../context';
import { useQuery } from 'react-query';
import { message } from 'antd';

const Home = () => {
  const { token } = localStorage;

  const baseUrl = 'https://toko.ox-sys.com';
  const title = [
    'name',
    'unit',
    'zone',
    'barcode',
    'sku',
    'supplier',
    'lastUpdateTime',
  ];

  const [{ page, size, total, data }, dispatch] = useProductContext();
  const [filter, setFilter] = useState(data);
  // useEffect(() => {
  useQuery(
    ['getProducts', page, size],
    () =>
      token &&
      axios({
        url: `${baseUrl}/variations?page=${page}&size=${size}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }),
    {
      onSuccess: (res) => {
        if (res?.status) {
          dispatch({ type: 'setData', payload: res?.data?.items });
          setFilter(res?.data?.items);
          dispatch({ type: 'setTotal', payload: res?.data?.total_count });
        } else {
          message.error(res?.message || 'Something went wrong!');
        }
      },
      onError: (err) => {
        message.error(err?.message || 'Something went wrong!');
      },
    },
    {}
  );

  const onShowSizeChange = (current, size) => {
    dispatch({
      type: 'changePage',
      payload: current,
    });

    dispatch({
      type: 'setSize',
      payload: size,
    });
  };
  const handlePaginationChange = (n) => {
    dispatch({ type: 'changePage', payload: n });
  };

  const handleChange = (e) => {
    const { value } = e?.target;
    let filtered = data?.filter((item) => {
      return item?.name.toLowerCase().includes(value.toLowerCase());
    });
    filtered.sort(
      (a, b) =>
        a.name.toLowerCase().indexOf(value.toLowerCase()) -
        b.name.toLowerCase().indexOf(value.toLowerCase())
    );
    setFilter(filtered);
  };

  return (
    <Wrap>
      {token ? (
        <>
          <Table>
            <Table.Head>
              <Table.Tr>
                {title?.map((title) => {
                  return (
                    <Table.Th className='upper' key={title}>
                      {title}
                    </Table.Th>
                  );
                })}
              </Table.Tr>
              <FilterInput>
                <Table.Th>
                  <Input onChange={handleChange} placeholder='Search Name' />
                </Table.Th>
              </FilterInput>
            </Table.Head>
            <Table.Body>
              {filter?.map((item, index) => (
                <Table.Tr key={item?.id} index={index}>
                  <Table.Td>{item?.name || 'not given'}</Table.Td>
                  <Table.Td>{item?.unit || 'not given'}</Table.Td>
                  <Table.Td>{item?.zone || 'not given'}</Table.Td>
                  <Table.Td>{item?.barcode || 'not given'}</Table.Td>
                  <Table.Td>{item?.sku || 'not given'}</Table.Td>
                  <Table.Td>{item?.supplier || 'not given'}</Table.Td>
                  <Table.Td>{item?.lastUpdateTime || 'not given'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Body>
          </Table>

          <Space style={{ margin: '20px 0px' }}>
            <Pagination
              defaultCurrent={page}
              current={page}
              total={total}
              defaultPageSize={size}
              showSizeChanger
              onShowSizeChange={onShowSizeChange}
              pageSizeOptions={['5', '10', '20', '50', '100']}
              pageSize={size}
              onChange={handlePaginationChange}
            />
          </Space>
        </>
      ) : (
        <div className='nodata'>Log in to see the data</div>
      )}
    </Wrap>
  );
};

export default Home;
